import { writable } from 'svelte/store';

interface Step {
	/**
	 * A unique identifier for the step.
	 */
	id: string;
	/**
	 * The title of the step.
	 */
	title: string;
	/**
	 * The description of the step's metadata when it is completed.
	 */
	completion_description?: string;
	/**
	 * The error message of the step, if there is any.
	 * If this field is not empty, the step is considered as failed.
	 */
	error?: string;
}

// The steps of the updating process:
function createUpdateStepsStore() {
	const initial = [
		{
			id: 'connect',
			title: 'Connecting to AnkiConnect',
			completion_description: '',
			error: ''
		},
		{
			id: 'parse',
			title: 'Parsing notes...',
			completion_description: '',
			error: ''
		},
		{
			id: 'validate',
			title: 'Validating notes...',
			completion_description: '',
			error: ''
		},
		{
			id: 'update',
			title: 'Updating notes...',
			completion_description: '',
			error: ''
		},
		{
			id: 'complete',
			title: 'Update complete!',
			completion_description: '',
			error: ''
		}
	];

	const { subscribe, set, update } = writable<Step[]>(initial);

	const setStepCompletion = (id: string, description: string) => {
		update((steps) => {
			const step = steps.find((step) => step.id === id);
			if (step) {
				step.completion_description = description;
				step.error = '';
			}
			return steps;
		});
	};

	const setStepError = (id: string, error: string) => {
		update((steps) => {
			const step = steps.find((step) => step.id === id);
			if (step) {
				step.completion_description = '';
				step.error = error;
			}
			return steps;
		});
	};

	const clear = () => {
		set(initial);
	};

	return {
		subscribe,
		set,
		update,
		setStepCompletion,
		setStepError,
		clear
	};
}

export const UpdateStepsStore = createUpdateStepsStore();
