const axios = require('axios');
const fs = require('fs');  // fs 모듈 추가

// 사용자 이름과 주문 ID 정의 이름 넣으면 알아서 성 이름 분리
let users = [
    "정재현"
];
let orderId = "ABCDEF";  // 오더 아이디 6자리
const url = "https://www.koreanair.com/api/ci/dx/checkin/journeys";

// 텍스트 파일 경로 정의
const filePath = 'checkin_id.txt';  // 저장할 파일 이름

// 반 번호 저장 (건들지 마셈)
let sNum = 0;

// 각 사용자에 대해 요청 보내는 함수
async function checkInUser(userName, orderId, userIndex) {
    // 개웃긴게 성 이름이 뒤바뀜 ㅋ
    let lastName = userName.charAt(0);  // 첫 번째 글자를 성으로 처리
    let firstName = userName.slice(1);  // 첫 번째 글자 이후는 이름으로 처리

    // 사용자 번호 생성 (학교 이슈로 학번 첨가)
    let userNumber = '201' + `${(userIndex + 1).toString().padStart(2, '0')}`;

    let data = {
        departureDate: "2025-03-19",  // 출발 날짜
        firstName: firstName,
        lastName: lastName,
        orderId: orderId
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        let responseString = JSON.stringify(response.data);  // 응답 데이터 문자열로 변환

        // 항공편 번호 추출 (KE1043와 같은 항공편 번호)
        let flightInfo = responseString.split('"marketingFlightNumber":"');
        let flightNumber = flightInfo.length > 1 ? flightInfo[1].split('"')[0] : '정보 없음';

        // 이름 추출
        let name = `${userNumber}${userName}`;

        // 생년월일 추출
        let birthInfo = responseString.split('"dateOfBirth":"');
        let birthDate = birthInfo.length > 1 ? birthInfo[1].split('"')[0] : '생년월일 없음';

        // 좌석번호 추출
        let seatInfo = responseString.split('"seatNumber":"');
        let seatNumber = seatInfo.length > 1 ? seatInfo[1].split('"')[0] : '좌석번호 없음';

        // 파일에 저장할 내용 구성
        let result = `${flightNumber} / ${name} / ${seatNumber} / ${birthDate}\n`;

        // 텍스트 파일에 결과 추가
        fs.appendFileSync(filePath, result);

    } catch (error) {
        console.error(`Error for ${userName}:`, error.response ? error.response.data : error.message);
    }
}

// 자동으로 체크인 처리 함수
async function automateCheckIn() {
    // 파일 초기화
    fs.writeFileSync(filePath, '항공편번호 / 이름 / 좌석번호 / 생년월일\n');  // 파일 처음에 헤더 추가

    for (let index = 0; index < users.length; index++) {
        await checkInUser(users[index], orderId, index);
    }

    console.log(`Check-in saved to ${filePath}`);
}

// 실행
automateCheckIn();