DO $$
DECLARE
    main_user_id UUID;
    other_user_id UUID;
BEGIN
    -- 1. Find the main user by email
    SELECT id INTO main_user_id FROM auth.users WHERE email = 'ramonavil@gmail.com' LIMIT 1;

    -- 2. Find the other user by email
    SELECT id INTO other_user_id FROM auth.users WHERE email = 'ramon_avil@hotmail.com' LIMIT 1;

    IF main_user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el usuario ramonavil@gmail.com';
    END IF;

    -- 3. Assign ALL songs to main user initially (Reset)
    UPDATE songs SET owner_id = main_user_id;

    -- 4. If other user exists, assign 3 random songs to them
    IF other_user_id IS NOT NULL THEN
        UPDATE songs 
        SET owner_id = other_user_id 
        WHERE id IN (
            SELECT id FROM songs WHERE owner_id = main_user_id ORDER BY random() LIMIT 3
        );
        RAISE NOTICE 'Asignación completada. Principal: %, Otro: %', main_user_id, other_user_id;
    ELSE
        RAISE NOTICE 'Advertencia: No se encontró el usuario ramon_avil@hotmail.com. Todas las canciones son del principal.';
    END IF;

END $$;
