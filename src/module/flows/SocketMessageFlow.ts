/**
 * Handle different socket related flows that are not specifically connected to single functions but overall socket behavior or helpers.
 */
export const SocketMessageFlow = {
    /**
     * Provide a general helper to update any set of documents as a GM user.
     * 
     * @param message.data [Array] of {uuid: string, updateData: any}
     */
    async handleUpdateDocumentsAsGMMessage(message: Shadowrun.SocketMessageData) {
        console.debug('Shadowrun 5e | Handling update documents as GM message', message);

        for (const documentData of message.data as {uuid: string, updateData: any}[]) {
            const document = await fromUuid(documentData.uuid as any) as Actor.Implementation | Item.Implementation;
            if (!document) continue;
            if (!documentData.updateData) return;
            await document.update(documentData.updateData);
        }
    }
    
}