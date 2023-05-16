import {Chat} from "@/components/Chat";
import Head from "next/head";
import {useEffect,useRef,useState} from "react";
import {db} from "@/firebase"
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";

const issave=true;
const logs=collection(db,"messagelogs");

export default function Home() {
  /*메시지 형태 {role(system,user,assistant),content}*/
  const [messages,setMessages]=useState([]); //메시지 로그
  const [loading,setLoading]=useState(false); //메시지 전송여부
  const messagesEndRef=useRef(null); //마지막 메시지 위치

  const scrollToBottom = () =>{ //마지막 메시지 위치로 부드럽게 이동
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  }
  const handleSend=async (message)=>{ //message={role,content}
  const updatedMessages=[...messages,message]; 
  setMessages(updatedMessages);//로그에 추가
  console.log(updatedMessages);
  setLoading(true); //메시지 전송 중...

  const response = await fetch("/api/chat",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
    },
    body:JSON.stringify({
      messages:updatedMessages.slice(-6), //가장 마지막 6개 로그를 보냄
    }),
  });

  console.log(1,response);
  if (!response.ok){ //서버응답의 성공여부 체크
    setLoading(false);
    throw new Error(response.statusText);
  }

  //입력값 저장(firebase)
  if (issave){
    const now=new Date();
    const docRef=await addDoc(logs,{
    role:message.role,
    content:message.content,
    date:now,
  })
  }
  //response가 올때까지 기다린 후, json 변환(role, content)
  const result=await response.json();
  if (!result){
    return;
  }
  console.log(result);

  setLoading(false); //로딩 해제
  setMessages((messages)=>[...messages,result]); //로그에 응답 추가
  
  if (issave){
    //응답값 저장(firebase)
    const now=new Date();
    const docRef=await addDoc(logs,{
    role:result.role,
    content:result.content,
    date:now,
    })
  }
}

const handleReset=async()=>{
const q=query(logs,orderBy("date","asc"));
const logs_data=await getDocs(q);
const logs_arr=[];
logs_data.docs.forEach((doc)=>{
  logs_arr.push({role:doc.data()["role"],content:doc.data()["content"]});
});
setMessages([...logs_arr,
  {
    role:"assistant",
    content:"챗봇 'GPT'입니다. 무엇을 도와드릴까요?"
  }
  ]);
};
//messages 상태 변할때마다 스크롤 내림
useEffect(()=>{
  scrollToBottom();
},[messages]);
//처음 실행 시 기본 메시지 하나로 고정
useEffect(()=>{
  handleReset();
},[]);

const deletelog=async()=>{
  const q=query(logs);
  const logs_data=await getDocs(q);
  logs_data.forEach((doc)=>{
    deleteDoc(doc.ref);
  });
  setMessages([
    {
      role:"assistant",
      content:"챗봇 'GPT'입니다. 무엇을 도와드릴까요?"
    }
  ]);
}

return (
  <>
    <Head>
      <title>ChatGPT</title>
      <meta name="description" content="ChatGPT"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <link rel="icon" href="/favicon.ico"/>
    </Head>

    <div className="flex flex-col h-screen bg-stone-800">
      <div className="flex h-[50px] sm:h-[60px] bg-stone-800 border-b-4 border-yellow-400 py-2 px-2 sm:px-8 items-center justify-between">
        <div className="font-bold text-3xl flex text-center ">
            <h1 className="tx-2xl text-white underline decoration-yellow-400">ChatGPT</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
        <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
          <Chat
            messages={messages}
            loading={loading}
            onSendMessage={handleSend}
          />
          <div ref={messagesEndRef} /> {/*항상 메시지의 끝에 옴-여기까지 스크롤*/}
        </div>
      </div>

      <div className="flex h-[30px] sm:h-[60px] border-t-4 border-yellow-400 py-2 px-8 items-center">
        <button className="bg-red-500 text-white rounded-2xl px-3 py-2 max-w-[67%] whitespace-pre-wrap hover:bg-red-400 ml-auto" onClick={()=>{deletelog()}}>Delete log</button>
      </div>

    </div>
  </>
  );
}
