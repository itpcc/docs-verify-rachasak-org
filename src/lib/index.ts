// place files you want to import through the `$lib` alias in this folder.

import type { DocVrfRes } from "$lib/types";
import { fetchDocCerts, fetchMetadataFromServer } from '$lib/worker-common';
import { article26VrfInfo } from '$lib/worker-art26';
import { article28VrfInfo } from '$lib/worker-art28';

export const fetchDocByText = async (
	sign_method: string,
	request_code: string,
	tstToken: string
): Promise<DocVrfRes | null> => {
	const [ isFetchOk, fetchRes ] = await fetchMetadataFromServer(
		sign_method, request_code, null, tstToken
	);

	if (! isFetchOk) return null;

	if (fetchRes.sign_method === 'art28') {
		const [ certRes, certInfoList ] = await fetchDocCerts();
		const certKey = fetchRes.signing_info?.cert_key as string;

		if (
			! certRes ||
			!(certKey in certInfoList)
		) {
			return null;
		}

		console.log('certInfoList[certKey]', certInfoList[certKey]);
		return article28VrfInfo(fetchRes, certInfoList[certKey]);
	}

	if (fetchRes.sign_method === 'art26') {
		return article26VrfInfo(fetchRes, undefined);
	}

	return null;
};
