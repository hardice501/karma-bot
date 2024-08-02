import puppeteer from 'puppeteer';

async function getMailPlugData(dateStart: Date, dateEnd: Date): Promise<void> {
    const HOST_DOMAIN = 'your_host_domain';
    const CONFIG_ID = 'your_config_id';
    const CONFIG_PASSWORD = 'your_password';
    const login_url = `https://m158.mailplug.com/member/login?host_domain=${HOST_DOMAIN}&cid=${CONFIG_ID}`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', async (msg) => {
        const args = await Promise.all(msg.args().map((arg) => arg.jsonValue()));
        console.log(args.join(' '));
    });

    await page.goto(login_url);
    console.log('login_url:', login_url);

    // XPath를 사용하여 입력 필드에 접근하여 아이디를 입력합니다.
    const inputValue = await page.evaluate((CONFIG_PASSWORD: string) => {
        const pwd_inputField = document.evaluate(
            '/html/body/section/div/div[1]/div/div/div[1]/div[2]/form/div[2]/input',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLInputElement;
        if (pwd_inputField) {
            pwd_inputField.value = CONFIG_PASSWORD; // 'your-username'을 원하는 아이디로 변경하세요.
            console.log('비밀 번호 입력 되었음');
            return pwd_inputField.value; // 입력된 값을 반환합니다.
        } else {
            console.log('비밀번호 입력 필드를 찾을 수 없습니다.');
            return null; // 입력 필드를 찾지 못한 경우 null을 반환합니다.
        }
    }, CONFIG_PASSWORD);

    if (!inputValue) {
        return;
    }

    // XPath를 사용하여 버튼을 찾아 클릭합니다.
    const buttonClicked = await page.evaluate(() => {
        const login_button = document.evaluate(
            '/html/body/section/div/div[1]/div/div/div[1]/div[2]/form/button',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
        ).singleNodeValue as HTMLButtonElement;
        if (login_button) {
            login_button.click();
            console.log('버튼을 클릭했습니다.');
            return true; // 버튼 클릭 성공을 반환합니다.
        } else {
            console.log('버튼을 찾을 수 없습니다.');
            return false; // 버튼을 찾지 못한 경우 false를 반환합니다.
        }
    });

    if (!buttonClicked) {
        return;
    }

    // 버튼 클릭 후 페이지 이동을 기다립니다.
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // 이동된 페이지의 URL을 가져옵니다.
    const dateStartFormated = dateStart.toISOString();
    const dateEndFormated = dateEnd.toISOString();
    const table_url = `https://m158.mailplug.com/ra/worknote/works/list/?date_end=${dateEndFormated}&date_start=${dateStartFormated}&limit=10000&page=1`;
    const newUrl = page.url();
    if (newUrl !== login_url) {
        await page.goto(table_url);
        console.log('새로운 URL로 이동했습니다:', table_url);
    }

    // 테이블 데이터를 가져오기 위해 페이지가 로드될 때까지 대기합니다.
    await page.waitForSelector('table tbody tr');
    await page.evaluate(() => {
        const hoverElements = document.querySelectorAll('.work-status');
        hoverElements.forEach((element) => {
            const event = new MouseEvent('mouseover', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            element.dispatchEvent(event);
        });
    });

    // 테이블의 모든 값을 가져옵니다.
    const tableData = await page.evaluate(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const rows = document.querySelectorAll('table tbody tr'); // 적절한 선택자를 입력하세요.
        const datas: string[][] = [];

        // getTextFromChildren 함수를 page.evaluate 내부에서 정의
        const getTextFromChildren = (element: Element): string | string[] => {
            let texts: string[] = [];
            const text = element.textContent?.trim() || element.innerHTML.trim();
            if (element.childElementCount === 0 && text !== '') {
                return text;
            } else {
                for (let i = 0; i < element.children.length; i++) {
                    const child = element.children[i];
                    texts = texts.concat(getTextFromChildren(child) as string[]);
                }
            }
            return texts;
        };

        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            const rowData: string[] = [];
            cells.forEach((cell, index) => {
                if (index === 6) {
                    const info = getTextFromChildren(cell) as string[];
                    const text = info[info.length - 1].replace('\n', ' ').replace('\t', '');
                    rowData.push(text);
                } else {
                    const status = cell.innerText.trim();
                    const text = status.replace('\n', ' ').replace('\t', '');
                    rowData.push(text);
                }
            });
            datas.push(rowData);
        });

        return datas;
    });

    // 데이터를 보기 쉽게 JSON 문자열로 변환하여 출력
    console.log(JSON.stringify(tableData, null, 2));

    await browser.close();
}

const mailPlugService = {
    getMailPlugData,
};

export default mailPlugService;