import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SambaNovaApi implements ICredentialType {
	name = 'sambanovaApi';
	displayName = 'SambaNova API';

	documentationUrl = 'https://cloud.sambanova.ai/?utm_source=n8n&utm_medium=external&utm_campaign=cloud_signup';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.sambanova.ai/v1',
			url: '/models',
		},
	};
}
