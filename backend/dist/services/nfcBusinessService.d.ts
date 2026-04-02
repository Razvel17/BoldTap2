import type { NfcBusinessProfile } from "../types/index";
interface CreateNfcBusinessInput {
    slug: string;
    name: string;
    title: string;
    phone?: string;
    email?: string;
    website?: string;
    bio?: string;
}
export declare function createNfcBusinessProfile(userId: string, input: CreateNfcBusinessInput): Promise<{
    success: boolean;
    data?: NfcBusinessProfile;
    error?: string;
}>;
export declare function getNfcProfileBySlug(slug: string): Promise<NfcBusinessProfile | null>;
export declare function getUserNfcProfile(userId: string): Promise<NfcBusinessProfile | null>;
export declare function updateNfcProfile(profileId: string, data: Partial<CreateNfcBusinessInput>): Promise<{
    success: boolean;
    data?: NfcBusinessProfile;
    error?: string;
}>;
export declare function getNfcProfileById(profileId: string): Promise<NfcBusinessProfile | null>;
export declare function deleteNfcProfile(profileId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function isSlugAvailable(slug: string): Promise<boolean>;
export {};
//# sourceMappingURL=nfcBusinessService.d.ts.map