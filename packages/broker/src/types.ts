export type Message={
    command:string,
    args:string,
    payload:string,
}

export enum Role{
    Publisher,
    Subscriber,
}