import { User } from "@prisma/client";

export const AccountSettingsContent = ({ user }: { user: User }) => {
    return (
        <div>
            <h1>Account Settings</h1>
            <p>Welcome, {user.name}!</p>
            <p>Your email address is {user.email}</p>
        </div>
    );
}
