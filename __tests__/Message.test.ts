import { Message } from '../src/Message';
import { Expect, Test, TestFixture, Setup, Teardown } from "alsatian";

@TestFixture('Message')
export class FixtureMessage {
    msg: Message = new Message();

    @Test('it should convert JS date to short format')
    public testDate() {
        this.msg.date = new Date("2003-01-02T04:05");
        Expect(this.msg.dateStr).toBe("01-02-03");
    }

    @Test('it should convert JS date to a short time format')
    public testTime() {
        this.msg.date = new Date("2003-01-02T04:05");
        Expect(this.msg.timeStr).toBe("04:05");
    }

    @Test('dateStr and timeStr should set date')
    public testDateTimeStr() {
        this.msg.date = new Date("2003-01-02T04:05");
        this.msg.timeStr = "02:01";
        this.msg.dateStr = "05-04-03";
        Expect(this.msg.date.toDateString()).toBe('Sun May 04 2003');
    }

    @Test('Length should be amount of 128 byte blocks message and header')
    public testLength() {
        this.msg.message = "hello world";
        Expect(this.msg.length).toBe(2);
        this.msg.message = "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
        Expect(this.msg.length).toBe(3);
    }
}