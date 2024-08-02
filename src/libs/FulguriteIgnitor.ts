import { ObservableInputTuple, Observer, Subject, combineLatest } from 'rxjs';

let log = console.log;
if (!process.env.FULGURITE_DEBUG) {
    log = () => {};
}

export enum RequisiteStatus {
    INITIALIZING = 'INITIALIZING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

interface RequisiteCondition {
    status: RequisiteStatus;
    description?: string;
    error?: Error;
}

// biome-ignore lint/suspicious/noExplicitAny: expected any
export type Condition = RequisiteCondition | any;

export function isReady(condition: Condition) {
    const status = condition.status;
    if (status) {
        return condition.status === RequisiteStatus.SUCCESS;
    }
    return !!condition;
}

export function allReady(conditions: { [key: string]: RequisiteStatus }) {
    return Object.values(conditions).every(isReady);
}

export function Requisite(name: string, _timeout?: number): Subject<Condition> {
    const subject = new Subject<Condition>();

    let deadline: NodeJS.Timeout | undefined;
    if (_timeout) {
        deadline = setTimeout(() => {
            const message = `${name} failed to initialize (timeout: ${_timeout}ms)`;
            subject.next({
                status: RequisiteStatus.ERROR,
                description: message,
                error: new Error(message),
            });
            subject.error(new Error(`${name} failed to initialize (timeout: ${_timeout}ms)`));
        }, _timeout);
    }
    subject.subscribe({
        next: (v) => {
            if (isReady(v) && deadline) {
                log(`${name} marked as success, clearing timeout`, v);
                clearTimeout(deadline);
            }
        },
    });

    return subject;
}

// biome-ignore lint/suspicious/noExplicitAny: intentionally any
export default function FulguriteIgnitor(sources: ObservableInputTuple<any>, observer?: Partial<Observer<unknown>>) {
    const initialized = combineLatest(sources);

    observer && initialized.subscribe(observer);

    return initialized;
}
