import PropTypes from 'prop-types';
import { HiX } from 'react-icons/hi';
import TrashIllustration from '../../assets/Trash-WarmTone.svg';

/**
 * DeleteConfirmation - Styled confirmation modal for deletions
 */
const DeleteConfirmation = ({
	open,
	title = 'Are you sure?',
	message = 'This action cannot be undone. All values associated with this field will be lost.',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onCancel,
	loading = false,
}) => {
	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-60 z-40"
				onClick={onCancel}
			/>

			{/* Modal container */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-6">
				<div className="relative bg-white rounded-[28px] shadow-2xl max-w-5xl w-full overflow-hidden">
					<button
						onClick={onCancel}
						disabled={loading}
						aria-label="Close"
						className="absolute top-4 right-4 z-50 p-2 rounded-full text-gray-400 hover:text-gray-600 bg-white/0 disabled:opacity-50 transition-colors"
					>
						<HiX className="w-6 h-6" />
					</button>
					<div className="flex flex-col md:flex-row items-stretch">
						{/* Left: Content */}
						<div className="w-full md:w-1/2 p-10 md:pl-12 md:pr-8">
							<div className="flex items-start justify-between">
								<h2 className="text-5xl font-extrabold text-[#FDB54A] leading-tight">{title}</h2>
								<button
									onClick={onCancel}
									disabled={loading}
									className="text-gray-400 hover:text-gray-600 ml-4"
								>
									<HiX className="w-6 h-6" />
								</button>
							</div>

							<p className="mt-6 text-gray-700 max-w-md">{message}</p>

							<div className="mt-10 flex items-center gap-4">
								<button
									onClick={onCancel}
									disabled={loading}
									className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
								>
									{cancelText}
								</button>

								<button
									onClick={onConfirm}
									disabled={loading}
									className="px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
								>
									{loading ? 'Processing...' : confirmText}
								</button>
							</div>
						</div>

						{/* Right: Illustration */}
						<div className="w-full md:w-1/2 bg-white p-6 flex items-center justify-center">
							<img
								src={TrashIllustration}
								alt="Trash illustration"
								className="w-full max-w-lg object-contain"
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

DeleteConfirmation.propTypes = {
	open: PropTypes.bool.isRequired,
	title: PropTypes.string,
	message: PropTypes.string,
	confirmText: PropTypes.string,
	cancelText: PropTypes.string,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

export default DeleteConfirmation;

