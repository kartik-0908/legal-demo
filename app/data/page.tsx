import { extractText } from "../actions/vector";



export default function Page() {
    const callfunc = async () => {
        'use server'
        extractText();
      }
      
  return (
    <div className="flex h-screen w-screen items-center justify-center">
     <button onClick={callfunc}>Extract Text</button>
    </div>
  );
}