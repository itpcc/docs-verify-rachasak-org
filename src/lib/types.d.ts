//* Type definition
export type GeneralObject = {
	[key: string]: string | GeneralObject
};
export type ErrorInfo = {
	err_cde: number,
	err_desc: string,
	err_meta: any
};
export type DocVerifyResult<ResponseInfo extends object> =
	[ true, ResponseInfo ] |
	[ false, ErrorInfo];
export type FetchMetadataFromServerResult = {
	req_id: string,
	sign_method: string,
	tmpl_name: string,
	input_data: GeneralObject,
	req_from: string,
	gen_at: Date,
	signing_info: GeneralObject,
	preview_png: string,
	file_hash: string,
};
export type CertInfo = GeneralObject & {
	certificate: {
		base: string,
		chain: string,
		root: string
	},
	name: string,
	authoriser_name: string,
	cert_request_date: string,
	cert_request_id: string
};
export type DocVrfRes = {
	articleType: number,
	dclrText: string,
	docImg?: string | undefined,
	vrfInfo: DocVrfResVrfInfo[]
};
export type DocVrfResVrfInfo = {
	header: string,
	detail: string,
	icon?: string | undefined,
	asHTML?: boolean
};