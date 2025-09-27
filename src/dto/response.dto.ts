export interface ResponseDTO {
    status : "success" | "error" | "warning";
    code : number;
    message : string;
    data? : any;
}

export interface SearchParams {
    page? : number;
    limit? : number;
}