import { IOfflineEntity } from '../interface/IOfflineEntity';

/**
 * Represents the base class for entities, providing common properties and functionality
 * for offline entities.
 *
 * @implements {IOfflineEntity}
 */
export class EntityBase implements IOfflineEntity {
    id: string;
    created: number;
    lastModified: number;

    constructor() {
        this.id = crypto.randomUUID();
        this.created = Date.now();
        this.lastModified = Date.now();
    }
}
