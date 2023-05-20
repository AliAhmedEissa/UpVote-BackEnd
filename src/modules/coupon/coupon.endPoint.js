import { systemRoles } from "../../utils/systemRoles.js";



export const endPoints = {
    CREAT_COUPON: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    UPDATE_COUPON: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
}