



export class SyncHelper{


    static async fetch<T>(url: string, func:(result:T) => void): Promise<T> {
        const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
    }

}