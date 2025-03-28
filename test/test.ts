import {
  LocalStorageProvider,
  OfflineStorage,
} from '../src/index';
import { PersistedEntity } from '../src/storage/entity/PersistedEntity';
import {
  PersistedEntityBuilder,
} from '../src/storage/entity/PersistedEntityBuilder';
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
class User extends PersistedEntity<User> {
    id: string;
    created: number;
    lastModified: number;
    name: string;
    age: number;
    birthDate: Date | null = null;
    constructor(name: string, age: number) {
        super(new PersistedEntityBuilder<User>()
            .addFormatter('name', new CustomStringFormater())
            .addFormatter('birthDate', new CustomDateFormater())
        );
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

    async runCommands() {

        
        this.storage.getCollection("users").toArray().then((users) => {

            console.log('Users:', users);  
            
            // users.forEach((user) => {
            //     console.log(user);
            // });

            const queried = this.storage.toQueryableArray<User>(users as unknown as User[]);
            const subset = queried.where((user ) => user.age >= 90).take(2);
            console.log('Subset of users:', subset);



            //  storage.deleteMany("users", users); 
            // users.forEach((user) => {
            //     storage.delete("users", user);
            // });

        });

        const newUser = new User('Magnus', Math.floor(Math.random() * 100));
        this.storage.insert('users', newUser);

        const retrievedUser = await this.storage.getCollection<User>('users').findById(newUser.id);
        if (retrievedUser) {
            console.log('Retrieved user:', retrievedUser);
            console.log('Retrieved user name:', retrievedUser.name); // Should be "JOHN DOE"
        }


    }
    constructor() {


        const provider = new LocalStorageProvider();
        //const provider = new IndexedDBProvider

        this.storage = new OfflineStorage(provider, 'testStorage');
        this.storage.init().then(async () => {
            console.log('Storage initialized');
            await this.runCommands();


        }
        ).catch(async () => {
            this.storage.addCollection('users');
            this.storage.save();
            await this.runCommands();

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