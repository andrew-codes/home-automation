import { HYDRATE } from 'next-redux-wrapper';
import { AllActions, State } from './types';

const reducer = (state: State = {}, action: AllActions) => {
    switch (action.type) {
        case HYDRATE:
            return state
        default:
            return state
    }
}

export default reducer