import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

import { ChatOpenAI } from '@langchain/openai';

export class ChatModelSambaNova implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SambaNova Chat Model',
		name: 'chatModelSambaNova',
		icon: 'file:sambanova.svg',
		group: ['transform'],
		version: 1,
		description: 'SambaNova Language Model',
		defaults: {
			name: 'SambaNova Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatsambanova/',
					},
				],
			},
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'sambanovaApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.sambanova.ai/v1',
		},
		properties: [
			{
				displayName: 'Connection Hint',
				name: 'connectionHint',
				type: 'notice',
				default: '',
				description: 'This node is used to connect a SambaNova model into an AI workflow. It outputs a language model object that can be passed into other nodes like AI chains or Agents.',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: '/models',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
									{
										type: 'filter',
										properties: {
											pass: '={{ $responseItem.object === "model" }}',
										},
									},
									{
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.id}}',
											value: '={{$responseItem.id}}',
										},
									},
								],
							},
						},
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'model',
					},
				},
				description:
					'The model which will generate the completion. <a href="https://docs.sambanova.ai/cloud/docs/get-started/supported-models">Learn more</a>.',
					// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
					default: 'DeepSeek-V3-0324',
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokensToSample',
						default: 4096,
						description: 'The maximum number of tokens to generate in the completion',
						type: 'number',
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
						description:
							'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
						type: 'number',
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('sambanovaApi');

		const modelName = this.getNodeParameter('model', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as {
			maxTokensToSample?: number;
			temperature: number;
		};

		const model = new ChatOpenAI({
			apiKey: credentials.apiKey as string,
			modelName,
			configuration: {
				baseURL: 'https://api.sambanova.ai/v1',
			},
			maxTokens: options.maxTokensToSample,
			temperature: options.temperature,
		});

		return {
			response: model,
		};
	}
}
