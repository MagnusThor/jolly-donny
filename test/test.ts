import {
  IndexedDBProvider,
  OfflineStorage,
} from '../src/index';
import { OfflineEntity } from '../src/storage/entity/OfflineEntity';
import { IFormatter } from '../src/storage/interface/IFormatter';

class CustomStringFormater implements IFormatter<string> {
    format(value: string): string {
        return value.toLowerCase(); // always store the value in lower case
    }

    parse(value: string): string {
        return value.toUpperCase(); // always return the value in upper case
    }
}
class CustomDateFormater implements IFormatter<Date | null> {
    format(value: Date | null): Date | null {
        // Store the Date object as is
        return value;
    }
    parse(value: Date | null): Date | null {
        if (!value) {
            return null;
        }
        value.setHours(0, 0, 0, 0); // set the time to 00:00:00.000
        return value;
    }
}

class User extends OfflineEntity<User> {
    id: string;
    created: number;
    lastModified: number;
    name: string;
    age: number;
    birthDate: Date | null = null;
    constructor(name: string, age: number) {
        super({
            formatters: {
                name: new CustomStringFormater(),
                birthDate: new CustomDateFormater(),
            },
        });
        this.id = crypto.randomUUID();
        this.created = Date.now();
        this.lastModified = Date.now();
        this.name = name;
        this.age = age;
        this.birthDate = new Date();
    }
}



export class TestClint {
    storage: OfflineStorage;

    async setup() {

    }

    async runCommans() {
        this.storage.getModel("users").toArray().then((users) => {

            users.forEach((user) => {
                console.log(user);
            });

            //  storage.deleteMany("users", users); 
            // users.forEach((user) => {
            //     storage.delete("users", user);
            // });
        });

        const mewUser = new User('Magnus', Math.floor(Math.random() * 100));


        this.storage.insert('users', mewUser);

        const retrievedUser = await this.storage.getModel<User>('users').findById(mewUser.id);
        if (retrievedUser) {
            console.log('Retrieved user:', retrievedUser);
            console.log('Retrieved user name:', retrievedUser.name); // Should be "JOHN DOE"
        }


    }
    constructor() {


        //const provider = new LocalStorageProvider();
        const provider = new IndexedDBProvider

        this.storage = new OfflineStorage(provider, 'testStorage');
        this.storage.init().then(async () => {
            console.log('Storage initialized');
            await this.runCommans();


        }
        ).catch(async () => {
            this.storage.addModel('users');
            this.storage.save();
            await this.runCommans();

        }
        );



        // if(!storage.getModel('users')){
        //     storage.addModel('users');      
        // }

        //  const user = new User('John Doe', 25);
        //  storage.insert("users",user);

        //  storage.save();

    }

    async test() {

        return true;

    }
}

document.addEventListener('DOMContentLoaded', () => {

    const testApp = new TestClint()

    testApp.test();



});