export interface DiceSoNice {
    showForRoll: (roll: Roll, user: User, synchronize: boolean, whisper: User[], blind: boolean, messageUuid?: string) => void;
}
