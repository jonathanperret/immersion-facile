import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FederatedIdentity } from "shared";

interface AuthState {
  federatedIdentity: FederatedIdentity | null;
}

const initialState: AuthState = {
  federatedIdentity: null,
};

const onFederatedIdentityReceived = (
  state: AuthState,
  action: PayloadAction<FederatedIdentity>,
) => {
  state.federatedIdentity = action.payload;
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    federatedIdentityProvided: onFederatedIdentityReceived,

    federatedIdentityFromStoreToDeviceStorageTriggered: (state) => state,
    federatedIdentityFromStoreToDeviceStorageSucceeded: (state) => state,

    federatedIdentityFoundInDevice: onFederatedIdentityReceived,
    federatedIdentityNotFoundInDevice: (state) => state,

    federatedIdentityInDeviceDeletionTriggered: (state) => state,
    federatedIdentityInDeviceDeletionSucceeded: (state) => state,
  },
});
