import { supabase } from './supabaseClient';
import { TEST_USER_NORMAL, TEST_USER_PRO, MEXICO_LOCATIONS } from '../constants';

export const seedTestUsers = async (onRegisterPro: (data: any) => void) => {
    console.log('Iniciando seeding de usuarios de prueba...');

    const processUser = async (testData: any, isPro: boolean) => {
        let userId: string | undefined;

        // Intentar Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testData.email,
            password: testData.password,
        });

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                console.log(`El usuario ${testData.email} ya existe, intentando obtener ID via Sign In...`);
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: testData.email,
                    password: testData.password,
                });
                if (signInError) throw signInError;
                userId = signInData.user?.id;
            } else {
                throw signUpError;
            }
        } else {
            userId = signUpData.user?.id;
        }

        if (userId) {
            // Upsert profile
            const { error: profileError } = await supabase.from('profiles').upsert([{
                id: userId,
                name: testData.name,
                email: testData.email,
                phone: testData.phone || '',
                role: isPro ? 'PRO' : 'USER'
            }]);

            if (profileError) throw profileError;

            if (isPro) {
                const selectedState = MEXICO_LOCATIONS.find(s => s.id === testData.stateId);
                await onRegisterPro({
                    ...testData,
                    id: userId,
                    state: selectedState?.name || '',
                    municipality: testData.municipality
                });
            }
            return userId;
        }
    };

    try {
        const normalUserId = await processUser(TEST_USER_NORMAL, false);
        console.log('Usuario normal procesado:', normalUserId);

        const proUserId = await processUser(TEST_USER_PRO, true);
        console.log('Profesional de prueba procesado:', proUserId);

        return { success: true };
    } catch (error) {
        console.error('Error durante el seeding:', error);
        return { success: false, error };
    }
};
