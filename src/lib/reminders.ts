import { pb } from "./pocketbase";

export type Reminder = {
    id: string;
    title: string;
    amount: number;
    next_due_date: string;
    is_active: boolean;
    frequency: number;
    unit: 'days' | 'weeks' | 'months' | 'years';
};

export async function getReminders() {
    return await pb.collection("reminders").getFullList<Reminder>({
        sort: "next_due_date",
    });
}

export async function createReminder(data: Partial<Reminder>) {
    const user = pb.authStore.model;
    if (!user?.family_id) throw new Error("No family");

    return await pb.collection("reminders").create({
        ...data,
        family_id: user.family_id,
        is_active: true
    });
}

export async function deleteReminder(id: string) {
    return await pb.collection("reminders").delete(id);
}

export async function updateReminder(id: string, data: Partial<Reminder>) {
    return await pb.collection("reminders").update(id, data);
}
