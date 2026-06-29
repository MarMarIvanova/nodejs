export interface UserRecord {
    id: number;
    username: string;
    password: string;
    displayName: string;
    emails: { value: string }[];
}

type Callback<T> = (err: Error | null, result?: T | null) => void;

const records: UserRecord[] = [
    {
        id: 1,
        username: 'user',
        password: '123456',
        displayName: 'demo user',
        emails: [{ value: 'user@mail.ru' }],
    },
    {
        id: 2,
        username: 'jill',
        password: 'birthday',
        displayName: 'Jill',
        emails: [{ value: 'jill@example.com' }],
    },
];

export function findById(id: number, cb: Callback<UserRecord>): void {
    process.nextTick(() => {
        const idx = id - 1;
        if (records[idx]) {
            cb(null, records[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
}

export function findByUsername(username: string, cb: Callback<UserRecord>): void {
    process.nextTick(() => {
        for (const record of records) {
            if (record.username === username) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
}

export function verifyPassword(user: UserRecord, password: string): boolean {
    return user.password === password;
}

export function createUser(
    username: string,
    password: string,
    displayName: string | undefined,
    email: string | undefined,
    cb: Callback<UserRecord>,
): void {
    process.nextTick(() => {
        const existing = records.find((r) => r.username === username);
        if (existing) {
            return cb(new Error('User already exists'));
        }
        const id = records.length ? Math.max(...records.map((r) => r.id)) + 1 : 1;
        const user: UserRecord = {
            id,
            username,
            password,
            displayName: displayName || username,
            emails: email ? [{ value: email }] : [],
        };
        records.push(user);
        cb(null, user);
    });
}
