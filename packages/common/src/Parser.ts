import { Message } from "./types"
export class Parser {

    private static delimiter = "\r\n\r\n"

    /*On client can send multiple messages and they are all combine in the same tcp chunck
    So we need to split the messages 
    */
   static getFrames(data:string):{frames:string[],pending:string}{
        const frames:string[]=[];
        while(data.indexOf(this.delimiter)!==-1){
            frames.push(data.slice(0,data.indexOf(this.delimiter)+this.delimiter.length))
            data=data.slice(data.indexOf(this.delimiter)+this.delimiter.length);
        }
        return {frames:frames,pending:data}
    }
    /* For each frame (message) receive we parse it to get the content : 
     - command, 
     - subject,
     - payload
    */
    static parse(data: string): { messages: Message[], pending: string } {
        const {frames,pending} = this.getFrames(data);
        const messages: Message[] = [];
        let i = 0,cmd,args,pos=0,payload;
        while (i<frames.length) {
            if(frames[i].indexOf(this.delimiter)=== -1){
                break;
            }
            pos=frames[i].indexOf(" ");
            cmd=frames[i].slice(0,pos);
            frames[i]=frames[i].slice(pos+1);
            pos=frames[i].indexOf("\n");
            args=frames[i].slice(0,pos);
            frames[i]=frames[i].slice(pos+1);
            pos=frames[i].indexOf("\r\n\r\n");
            payload=frames[i].slice(0,pos);

            messages.push({command:cmd,args:args,payload:payload})
            i++
        }
        return { messages: messages, pending: pending }
    }
}