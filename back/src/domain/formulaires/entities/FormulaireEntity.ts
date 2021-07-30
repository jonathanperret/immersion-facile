import { FormulaireDto } from "../../../shared/FormulaireDto";

type FormulaireProps = {
    uuid: string;
    email: string;
    dateStart: Date;
    dateEnd: Date;
};

export class FormulaireEntity {
    public readonly uuid: string;
    public readonly email: string;
    public readonly dateStart: Date;
    public readonly dateEnd: Date;

    private constructor({ uuid, email, dateStart, dateEnd }: FormulaireProps) {
        this.uuid = uuid;
        this.email = email;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
    }

    public static create(dto: FormulaireDto) {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(dto.email)) {
            throw new Error(`Email (${dto.email}) must match the RFC standard.`);
        }

        if (dto.dateEnd <= dto.dateStart) {
            throw new Error("The start date (${formulaire}) must be before the end date.");
        }

        return new FormulaireEntity({
            uuid: dto.uuid,
            email: dto.email,
            dateStart: dto.dateStart,
            dateEnd: dto.dateEnd,
        });
    }
}

export const formulaireEntityToDto = (entity: FormulaireEntity): FormulaireDto => ({
    uuid: entity.uuid,
    email: entity.email,
    dateStart: entity.dateStart,
    dateEnd: entity.dateEnd
});
