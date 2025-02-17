export type SkillType = 'frontend' | 'backend' | 'mobile' | 'fullstack';

export interface Participant {
    name: string;
    department: string;
    skills: string;
    skillType: SkillType;
    isCaptain: boolean;
    email: string;
    selected: boolean;
}

export interface Team {
    captain: Participant;
    members: Participant[];
}

export interface GameState {
    teams: Team[];
    availableParticipants: Participant[];
    currentCaptainIndex: number;
}