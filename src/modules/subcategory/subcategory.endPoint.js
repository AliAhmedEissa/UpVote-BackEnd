import { systemRoles } from "../../utils/systemRoles.js";



export const endPoints = {
    CREAT_SUB_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    UPDATE_SUB_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
}