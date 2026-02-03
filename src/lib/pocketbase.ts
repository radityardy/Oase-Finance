import PocketBase from 'pocketbase';

export const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

export const createClient = () => {
    return new PocketBase(PB_URL);
}

export const pb = createClient();
pb.autoCancellation(false);
