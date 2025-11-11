// import type { BuilderStructure } from '@requil/db';

// export type VariablesValidationMode = 'strict' | 'permissive';

// export type TemplateSnapshot = {
// 	stableId: string;
// 	snapshotId: string;
// 	builderStructure?: BuilderStructure;
// 	mjml: string;
// 	variablesSchema: unknown;
// 	subjectLines: string[];
// 	preheader?: string;
// 	notes?: string[];
// 	safetyFlags?: string[];
// };

// export type BrandKit = {
// 	colors?: Record<string, string>;
// 	typography?: Record<string, string>;
// 	footer?: { enabled: boolean; locale?: 'en' | 'pl' };
// };

// export type RenderInput = {
// 	snapshot: TemplateSnapshot;
// 	variables: Record<string, unknown>;
// 	brandKit?: BrandKit;
// 	subject?: string;
// 	preheader?: string;
// 	mode?: VariablesValidationMode;
// };

// export type BuilderRenderInput = {
// 	builderStructure: BuilderStructure;
// 	variablesSchema: unknown;
// 	subjectLines: string[];
// 	variables: Record<string, unknown>;
// 	brandKit?: BrandKit;
// 	subject?: string;
// 	preheader?: string;
// 	mode?: VariablesValidationMode;
// };

// export type RenderOutput = {
// 	html: string;
// 	plaintext: string;
// 	warnings: string[];
// 	usedSubject: string;
// 	usedPreheader?: string;
// 	sizeBytes: number;
// };
