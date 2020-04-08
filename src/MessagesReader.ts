import fs from 'fs';
import { MessageType, Message } from './Message';

export class MessagesReader {
    private _fHand: number;
    private _header = '';
    private _totalMessages = 0;

    constructor(readName: string) {
        this._fHand = fs.openSync(readName, 'r');
        this._header = this.readStr(0, 128);
        this._findTotalMessages();
    }

    close() {
        fs.closeSync(this._fHand);
    }

    private _findTotalMessages() {
        const {size} = fs.fstatSync(this._fHand);

        let curMsgPos = 1;
        let bytePos = 128;
        while (bytePos < size) {
            const msgLen = parseInt(this.readStr(bytePos+116, 6))*128;
            bytePos += msgLen;
            curMsgPos++;
        }
        this._totalMessages = curMsgPos;
    }

    get header(): string {
        return this._header;
    }

    get totalMessages(): number {
        return this._totalMessages;
    }

    readStr(pos: number, len: number): string {
        const buffer = Buffer.alloc(len);
        fs.readSync(this._fHand, buffer, 0, len, pos);
        return buffer.toString("binary").trim();
    }

    readByte(pos: number): number {
        const buffer = Buffer.alloc(1);
        fs.readSync(this._fHand, buffer, 0, 1, pos);
        return buffer.readUInt8(0);
    }

    readWord(pos: number): number {
        const buffer = Buffer.alloc(2);
        fs.readSync(this._fHand, buffer, 0, 2, pos);
        return buffer.readUInt16LE(0);
    }

    read(msgNum: number): MessageType {
        let curMsgPos = 1;
        let bytePos = 128;
        let msgBlockLen = 128;
        while (curMsgPos < msgNum) {
            const msgLen = parseInt(this.readStr(bytePos+116, 6))*128;
            bytePos += msgLen;
            curMsgPos++;
        }
        msgBlockLen = (parseInt(this.readStr(bytePos+116, 6))-1) * 128;
        const msgDate = new Date(
            `${this.readStr(bytePos+8, 8)} ${this.readStr(bytePos+16, 5)}`
                .replace(
                    /(\d{2})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2})/,
                    '20$3-$1-$2T$4:$5:00Z'
                )
        );

        return {
            statusFlag: this.readStr(bytePos, 1),
            number: parseInt(this.readStr(bytePos+1, 7)),
            dateStr: this.readStr(bytePos+8, 8),
            date: msgDate,
            timeStr: this.readStr(bytePos+16, 5),
            to: this.readStr(bytePos+21, 25),
            from: this.readStr(bytePos+46, 25),
            subject: this.readStr(bytePos+71, 25),
            password: this.readStr(bytePos+96, 12),
            refMsg: parseInt(this.readStr(bytePos+108, 8)),
            length: parseInt(this.readStr(bytePos+116, 6)),
            flag: this.readByte(bytePos+122),
            conference: this.readWord(bytePos+123),
            notUsed: this.readStr(bytePos+125, 2),
            tagLine: this.readStr(bytePos+127, 1),
            message: this.readStr(bytePos+128, msgBlockLen).replace(/\xE3/g, '\n'),
        }
    }
}

export default MessagesReader;
