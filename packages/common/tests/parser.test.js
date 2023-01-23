import { Parser} from '../src/Parser'
describe('Parser tests',()=>{
    
    test("simple frame check length",()=>{
        const payload="SUBSCRIBE test\n\r\n\r\n"
        const {frames,pending}=Parser.getFrames(payload);
        expect(frames.length).toBe(1)
        console.log(frames)
        expect(pending).toBe('')
    })
    test("simple frame check length",()=>{
        const payload="PUBLISH test\ntest\r\n\r\n"
        const {frames,pending}=Parser.getFrames(payload);
        expect(frames.length).toBe(1)
        expect(pending).toBe('')
    })

    test("two frames check length",()=>{
        const payload="PUBLISH test\ntest\r\n\r\nPUBLISH test\ntest\r\n\r\n"
        const {frames,pending}=Parser.getFrames(payload);
        expect(frames.length).toBe(2)
        expect(pending).toBe('')
    })

    test("Incomplete frame",()=>{
        const payload="SUBSCRIBE test\r"
        const {frames,pending}=Parser.getFrames(payload);
        expect(frames.length).toBe(0)
        expect(pending).toBe("SUBSCRIBE test\r")
    })
    test("Simple frame with fragmented data",()=>{
        const payload="PUBLISH test\ntest\r\n\r\nSUBSCRIBE test"
        const {frames,pending}=Parser.getFrames(payload);
        expect(frames.length).toBe(1)
        expect(pending).toBe("SUBSCRIBE test")
    })

    test("Two frames with fragmented data",()=>{
        const payload="PUBLISH test\ntest\r\n\r\nPUBLISH test\ntest\r\n\r\nSUBSCRIBE test"
        const {frames,pending}=Parser.getFrames(payload);
        expect(frames.length).toBe(2)
        expect(pending).toBe("SUBSCRIBE test")
    })

    test("Simple frame subscribe",()=>{
        const payload="SUBSCRIBE test\n\r\n\r\n"
        const {messages,pending}=Parser.parse(payload);
        expect(messages.length).toBe(1)
        console.log(pending)
        expect(pending).toBe('')
        expect(messages[0]).toEqual({command:"SUBSCRIBE",args:"test",payload:""})
    })

    test("Simple frame get info",()=>{
        const payload="PUBLISH test\ntest\r\n\r\n"
        const {messages,pending}=Parser.parse(payload);
        expect(messages.length).toBe(1)
        expect(pending).toBe('')
        expect(messages[0]).toEqual({command:"PUBLISH",args:"test",payload:"test"})
    })
})