import { DateFormat } from "ts-nodash";

export interface MessageType {
    [key:string]: any;
    statusFlag: string; /*  ' ' = public, unread
                            '-' = public, read
                            '+' = private, unread
                            '*' = private, read
                            '~' = comment to Sysop, unread
                            '`' = comment to Sysop, read
                            '%' = passWord protected, unread
                            '^' = passWord protected, read
                            '!' = group passWord, unread
                            '#' = group passWord, read
                            '$' = group passWord to all */
    number: number;  // written as text
    dateStr: string; // mm-dd-yy
    date?: Date; // optional JS Date object
    timeStr: string; // HH:MM 24 hour time
    to: string; 
    from: string;
    subject: string;
    password: string;
    refMsg: number; // written as text
    length?: number; // written as text
    flag: number; // written as byte
    conference: number; // written as word
    notUsed: string;
    tagLine: string; /*  '*' = Tagline exists
                         ' ' = Tagline does not exists */
    message: string;
}

/**
 * Base class to simplify handling QWK messages.
 */
export class Message implements MessageType {
    [key:string]:any;
    statusFlag: string = '';
    number: number = -1;
    date: Date = new Date();
    to: string = '';
    from: string = '';
    subject: string = '';
    password: string = '';
    refMsg: number = -1;
    flag: number = -1;
    conference: number = -1;
    notUsed: string = '';
    tagLine: string = '';
    message: string = '';

    constructor(initObj?: MessageType) {
        if (initObj) {
            const keys = Object.keys(initObj);
            keys.forEach((key)=>this[key]=initObj[key])    
        }
    }

    get dateStr(): string {
        return DateFormat(this.date, 'MM-DD-YY');
    }

    set dateStr(newDate: string) {
        const dateMatches = newDate.match(/(\d{2})\-(\d{2})\-(\d{2})/);
        if (dateMatches) {
            this.date.setMonth(parseInt(dateMatches[1])-1);
            this.date.setDate(parseInt(dateMatches[2]));
            this.date.setFullYear(2000+parseInt(dateMatches[3]));
        }
    }

    get timeStr(): string {
        return DateFormat(this.date, 'hh:mm');
    }

    set timeStr(newTime: string) {
        const timeMatches = newTime.match(/(\d{2}):(\d{2})/);
        if (timeMatches) {
            this.date.setHours(parseInt(timeMatches[1]));
            this.date.setMinutes(parseInt(timeMatches[2]));
        }
    }

    get length(): number {
        return Math.ceil(this.message.length / 128) + 1;
    }
}

