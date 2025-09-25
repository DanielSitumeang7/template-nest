export interface ResponseDTO {
    status : "success" | "error" | "warning";
    code : number;
    message : string;
}