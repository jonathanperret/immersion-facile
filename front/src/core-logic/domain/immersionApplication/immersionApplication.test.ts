describe("Playing with immersion application", () => {
    it("When no application has been submitted, there is no feedback", () => {

        const submitFeeback: string = useAppSelector(immersionApplicationSelectors.submitFeedbackStatus);
        const expectedFeedback = null;

        expect(submitFeeback).toBe(expectedFeedback);
        }
    );
});

