import {Configuration,OpenAIApi} from "openai";

const configuration = new Configuration({
    organization:process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration); //새로운 객체 생성

//기본 설정
const systemPrompt = "너는 내 개인비서 'GPT'야. 어떤 질문이든 확실한 답변을 신속하게 내려줘.";

export default async (req, res) => { //요청, 응답을 받음
  if (req.method !== "POST") { //Post 방법이 아니면 컷
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // POST messages 추출
  const { messages } = req.body;

  console.log([//api에 보낼 내용
    { role: "system", content: systemPrompt }, 
    ...messages.slice(-6),
  ]);

  // API Reference: https://platform.openai.com/docs/api-reference/chat/create
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.7, // ai 답변의 랜덤성
    max_tokens: 512, // 묻고 답하는 길이 max_tokens 값을 제한함. 이 값을 크게하면 컨텍스트 히스토리에 제약이 커짐.
    messages: [
      { role: "system", content: systemPrompt }, //시스템 포함
      ...messages.slice(-6), //이전 대화 중 최근 6개
    ],
  });

  // console.log(completion.data.choices[0].message);

  res.status(200).json({
    // AI 의 답변은 assistant 역할로 전송
    role: "assistant",
    // AI 의 답변은 choices[0].text 에 있음
    // 상세한 Response 형식은 다음을 참조 : https://platform.openai.com/docs/api-reference/chat/create
    content: completion.data.choices[0].message.content,
  });
};
