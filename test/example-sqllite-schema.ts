import {
  IOfflineStorageProvider,
  OfflineStorage,
  PersistedEntityBase,
} from '../src/index';
import {
  SQLLiteSchemeProvider,
} from '../src/storage/providers/SQLLiteSchemeProvider';

const logger = (...args: any[]) => {
    const p = document.createElement("p");
    p.textContent = JSON.stringify(args);
    document.querySelector("#output")?.append(p);
};

export class Note extends PersistedEntityBase {
    constructor(
        public id: string,
        public title: string,
        public content: string,
        public created: number
    ) {
        super();
    }
}

export class TestClint {
    storage!: OfflineStorage;

    async runTest() {
        const provider: IOfflineStorageProvider = new SQLLiteSchemeProvider();
        await provider.init('test_notes');

        // Create sample notes
        const note1 = new Note('1', 'First Note', 'This is a test note', Date.now());
        const note2 = new Note('2', 'Second Note', 'Another note here', Date.now());

        // Add notes
        await provider.update('notes', note1);
        await provider.update('notes', note2);

        // Fetch all notes
        const allNotes = await provider.all<Note>('notes');
        logger('All Notes:', allNotes);

        // Find one
        const found = await provider.findById<Note>('notes', '2');
        logger('Found Note:', found);

        // find first Note using title

        const firstNote = await provider.find<Note>('notes', (note) => note.title === 'First Note');
        logger('First Note:', firstNote);


        // Delete one
        await provider.delete('notes', note1);
        const afterDelete = await provider.all<Note>('notes');
        logger('After Delete:', afterDelete);


        
    }

    constructor() {
        this.runTest().then(() => {
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const testApp = new TestClint()
});