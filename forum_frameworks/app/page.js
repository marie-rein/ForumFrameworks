
'use client'
import Login from "../app/login/page";
import ForumPage from "../app/Forums/forum";
import Headerpublic from "../app/Components/headerpublic";


export default function Home() {
  return (
    <main>
     {/* <Login/> */}
     <Headerpublic/>
     <ForumPage/>
    </main>
  );
}