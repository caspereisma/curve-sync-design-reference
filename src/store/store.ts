import { configureStore } from '@reduxjs/toolkit';

export const createReferenceStore = () =>
    configureStore({
        reducer: {},
        devTools: true
    });

export const store = createReferenceStore();

export type ReferenceRootState = ReturnType<typeof store.getState>;
export type ReferenceAppDispatch = typeof store.dispatch;
