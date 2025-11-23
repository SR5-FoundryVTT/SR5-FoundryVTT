import { SR5_APPV2_CSS_CLASS } from '@/module/constants';


const SR5DocumentMixin = (base) => {
    const { HandlebarsApplicationMixin } = foundry.applications.api;

    return class SR5DocumentMixin extends HandlebarsApplicationMixin(base) {

        // TODO fix typing
        static DEFAULT_OPTIONS: any = {
            classes: [SR5_APPV2_CSS_CLASS],
            form: {
                submitOnChange: true,
                closeOnSubmit: false,
            },
            window: {
                resizable: true,
            },
        };
    };
};

export default SR5DocumentMixin;
