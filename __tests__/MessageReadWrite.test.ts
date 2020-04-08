import MessagesReader from '../src/MessagesReader';
import MessagesWriter from '../src/MessagesWriter';
import { Expect, Test, TestFixture, Setup, Teardown } from "alsatian";
import Path from 'path';
import fs from 'fs';
import { Message } from '../src/Message';

@TestFixture('MessageReadWrite')
export class FixtureMessageReader {
    msgsPath: string = Path.resolve(__dirname, "..", "dist", "messages.dat");

    @Teardown
    public teardownQ() {
        fs.unlinkSync(this.msgsPath);
    }

    @Test('Write and than read a header')
    public testHeader() {
        const qWriter: MessagesWriter = new MessagesWriter(this.msgsPath);
        qWriter.header = "Hello world";
        qWriter.close();

        const qReader: MessagesReader = new MessagesReader(this.msgsPath);
        Expect(qReader.header).toBe("Hello world");
        qReader.close();
    }

    @Test('Write and read messages')
    public testMesssages() {
        const msg1:Message = new Message();
        msg1.statusFlag = "*";
        msg1.number = 1;
        msg1.date = new Date("2020-04-08T13:00:00");
        msg1.to = "bob";
        msg1.from = "john";
        msg1.subject = "hello world";
        msg1.password = "password";
        msg1.refMsg = 0;
        msg1.flag = 42;
        msg1.conference = 1001;
        msg1.message = "This is a test.";
        const qWriter: MessagesWriter = new MessagesWriter(this.msgsPath);
        qWriter.header = "Hello world";
        qWriter.append(msg1);
        qWriter.close();

        const qReader: MessagesReader = new MessagesReader(this.msgsPath);
        Expect(qReader.read(1).to).toEqual(msg1.to);
        Expect(qReader.read(1).from).toEqual(msg1.from);
        Expect(qReader.read(1).subject).toEqual(msg1.subject);
        Expect(qReader.read(1).message).toEqual(msg1.message);
        Expect(qReader.read(1).flag).toEqual(msg1.flag);
        Expect(qReader.read(1).conference).toEqual(msg1.conference);
        qReader.close();
    }
}