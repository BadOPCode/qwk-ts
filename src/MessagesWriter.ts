import fs from 'fs';
import {DateFormat} from 'ts-nodash';
import {MessageType} from './Message';

export class MessagesWriter {
    private _fHand: number;
    private _header: string = '';
    private _totalMessages: number = 0;

    constructor(writeName: string) {
        this._fHand = fs.openSync(writeName, 'w');
    }

    close() {
        fs.closeSync(this._fHand);
    }

    get totalMessages(): number {
        return this._totalMessages;
    }

    get header(): string {
        return this._header;
    }

    set header(newHeader: string) {
        this.writeStr(0, 128, newHeader);
    }

    writeStr(pos: number, len: number, value: string, fill: number = 32) {
        const buffer = Buffer.alloc(len, fill);
        buffer.write(value, "binary");
        fs.writeSync(this._fHand, buffer, 0, len, pos);
    }

    writeByte(pos: number, value: number) {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(value);
        fs.writeSync(this._fHand, buffer, 0, 1, pos);
    }

    writeWord(pos: number, value: number) {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(value);
        fs.writeSync(this._fHand, buffer, 0, 2, pos);
    }

    write(pos: number, newMessage: MessageType) {
        const {size} = fs.fstatSync(this._fHand);
        if (size < 128) {
            this.header = "Made with QWK JS Library";
        }

        if (newMessage.date) {
            newMessage.dateStr = DateFormat(newMessage.date, 'MM-DD-YY');
            newMessage.timeStr = DateFormat(newMessage.date, 'hh:mm');
        }

        const msgSize = newMessage.message.length;
        if (!newMessage.length)
            newMessage.length = Math.ceil(msgSize / 128)+1;

        this.writeStr(pos, 1, newMessage.statusFlag);
        this.writeStr(pos+1, 7, ''+newMessage.number);
        this.writeStr(pos+8, 8, newMessage.dateStr);
        this.writeStr(pos+16, 5, newMessage.timeStr);
        this.writeStr(pos+21, 25, newMessage.to);
        this.writeStr(pos+46, 25, newMessage.from);
        this.writeStr(pos+71, 25, newMessage.subject);
        this.writeStr(pos+96, 12, newMessage.password);
        this.writeStr(pos+108, 8, ''+newMessage.refMsg);
        this.writeStr(pos+116, 6, ''+newMessage.length);
        this.writeByte(pos+122, newMessage.flag);
        this.writeWord(pos+123, newMessage.conference);
        this.writeStr(pos+125, 2, newMessage.notUsed);
        this.writeStr(pos+127, 1, newMessage.tagLine);
        this.writeStr(pos+128, newMessage.length*128, newMessage.message);
    }

    append(newMessage: MessageType) {
        const {size} = fs.fstatSync(this._fHand);

        this.write(size, newMessage);
        this._totalMessages++;
    }
}

export default MessagesWriter;
