import {Configuration,OpenAIApi} from "openai";

const configuration = new Configuration({
    organization:process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration); //새로운 객체 생성

//기본 설정
const systemPrompt = "너는 내 개인비서 'GPT'야. 선택에 대해 명확한 답변을 신속하게 내려줘.";

export default async (req, res) => { //요청, 응답을 받아
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
    // temperature 값이 높을 수록 AI 의 답변이 다양해짐
    temperature: 0.7,
    // max_tokens 값을 제한함. 이 값을 크게하면 컨텍스트 히스토리에 제약이 커짐.
    max_tokens: 512,
    /*
      전체 프롬프트를 묶어서 보냄
      system 은 항상 처음에 와야 함
      컨텍스트 유지를 위해 이전 메시지를 포함해서 보냄 (6개, 즉 대화 3개의 페어)
    */
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(-6),
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
