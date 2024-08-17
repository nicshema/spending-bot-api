export interface Spending {
    id: number,
    amount: string,
    category: string,
    username: string,
    created_at: Date,
    updated_at: Date,
}

export type CreateSpending = Omit<Spending, 'created_at' | 'updated_at' | 'id'> & Partial<Pick<Spending, 'created_at' | 'updated_at' | 'id'>>