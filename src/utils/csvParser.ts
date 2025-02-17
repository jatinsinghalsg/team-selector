import Papa from 'papaparse';
import { Participant, SkillType } from '@/types/participant';

const determineSkillType = (skills: string): SkillType => {
    const skillsLower = skills.toLowerCase().trim();
    
    // Normalize common variations
    const normalizedSkills = skillsLower
        .replace('node.js', 'nodejs')
        .replace('node js', 'nodejs')
        .replace('reactjs', 'react')
        .replace('react.js', 'react')
        .replace('react js', 'react');
    
    // Mobile skills check
    const hasMobile = normalizedSkills.includes('react native') || 
                     normalizedSkills.includes('react-native') || 
                     normalizedSkills.includes('flutter') ||
                     normalizedSkills.includes('ios') ||
                     normalizedSkills.includes('android') ||
                     normalizedSkills.includes('native');

    // Backend skills check
    const hasBackend = normalizedSkills.includes('nodejs') ||
                      normalizedSkills.includes('node ') ||  // Space after node to ensure word boundary
                      normalizedSkills.includes('php') ||
                      normalizedSkills.includes('python') ||
                      normalizedSkills.includes('java ') ||  // Space after java to avoid javascript
                      normalizedSkills.includes('flask') ||
                      normalizedSkills.includes('fastapi') ||
                      normalizedSkills.includes('fast api') ||
                      normalizedSkills.includes('go ') ||    // Space after go to avoid other words
                      normalizedSkills.includes('golang') ||
                      normalizedSkills.includes('nest') ||
                      normalizedSkills.includes('express');

    // Frontend skills check
    const hasFrontend = (
        (normalizedSkills.includes('react') && 
         !normalizedSkills.includes('react native') && 
         !normalizedSkills.includes('react-native')) ||
        normalizedSkills.includes('next') ||
        normalizedSkills.includes('vue') ||
        normalizedSkills.includes('angular') ||
        normalizedSkills.includes('html') ||
        normalizedSkills.includes('css') ||
        normalizedSkills.includes('webflow')
    );

    // Strict fullstack check - must have both BE and FE skills
    if (hasBackend && hasFrontend) {
        return 'fullstack';
    }

    // Single specialty takes precedence
    if (hasBackend) {
        return 'backend';
    }

    if (hasFrontend) {
        return 'frontend';
    }

    if (hasMobile) {
        return 'mobile';
    }

    // Default to backend for general skills (typescript/javascript)
    if (normalizedSkills.includes('typescript') || 
        normalizedSkills.includes('javascript')) {
        return 'backend';
    }

    // If no specific skills matched, default to backend
    return 'backend';
};

export const parseCSV = async (file: File): Promise<Participant[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const participants = results.data
                    .filter((row: any) => row.Name && row.Department)
                    .map((row: any) => {
                        const skills = row.Skills || '';
                        return {
                            name: row.Name,
                            department: row.Department,
                            skills: skills,
                            skillType: determineSkillType(skills),
                            isCaptain: row['Is captain?'] === 'Yes',
                            email: row['Email Address'],
                            selected: false
                        };
                    });
                resolve(participants);
            },
            error: (error) => reject(error)
        });
    });
};