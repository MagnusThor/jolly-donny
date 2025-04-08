import { IPersistedEntity } from '../interface/IPersistedEntity ';

/**
 * Represents the base class for entities, providing common properties and functionality
 * for offline entities.
 *
 * @implements {IPersistedEntity }
 */
export class PersistedEntityBase implements IPersistedEntity  {
    id: string | number | undefined;
    created: number;
    lastModified: number;

    constructor(id?: string | number) {
        this.id = id  || crypto.randomUUID(); 
        this.created = Date.now();
        this.lastModified = Date.now();
    }

  
}
