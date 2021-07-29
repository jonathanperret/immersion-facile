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

    public static create(formulaireDto: FormulaireDto) {

        const trimmedEmail = formulaireDto.email.trim();
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(trimmedEmail)) {
            throw new Error("Email must match the RFC standard.");
        }

        if (formulaireDto.dateEnd <= formulaireDto.dateStart) {
            throw new Error("The start date must be before the end date.");
        }

        return new FormulaireEntity({
            uuid: formulaireDto.uuid,
            email: formulaireDto.email,
            dateStart: formulaireDto.dateStart,
            dateEnd: formulaireDto.dateEnd
        });
    }
}

export const formulaireEntityToDto = (entity: FormulaireEntity): FormulaireDto => ({
    uuid: entity.uuid,
    email: entity.email,
    dateStart: entity.dateStart,
    dateEnd: entity.dateEnd
});
