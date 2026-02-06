import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/minio";

interface Bucket {
	name: string;
	creationDate: string;
}

interface ObjectInfo {
	name: string;
	size: number;
	lastModified: string;
}

export default function BucketManager() {
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
	const [objects, setObjects] = useState<ObjectInfo[]>([]);
	const [newBucketName, setNewBucketName] = useState("");

	useEffect(() => {
		fetchBuckets();
	}, []);

	useEffect(() => {
		if (selectedBucket) {
			fetchObjects(selectedBucket);
		}
	}, [selectedBucket]);

	const fetchBuckets = async () => {
		try {
			const res = await axios.get(`${API_URL}/buckets`);
			setBuckets(res.data);
		} catch (error) {
			console.error("Failed to load buckets", error);
		}
	};

	const fetchObjects = async (bucketName: string) => {
		try {
			const res = await axios.get(`${API_URL}/buckets/${bucketName}/objects`);
			setObjects(res.data);
		} catch (error) {
			console.error("Failed to load objects", error);
		}
	};

	const createBucket = async () => {
		if (!newBucketName.trim()) return;
		try {
			await axios.post(`${API_URL}/buckets?bucketName=${newBucketName}`);
			setNewBucketName("");
			fetchBuckets();
			alert("Bucket created successfully!");
		} catch (error: any) {
			alert("Failed to create bucket: " + error.response?.data);
		}
	};

	const deleteBucket = async (bucketName: string) => {
		if (!confirm(`Delete bucket "${bucketName}"?`)) return;
		try {
			await axios.delete(`${API_URL}/buckets/${bucketName}`);
			fetchBuckets();
			if (selectedBucket === bucketName) {
				setSelectedBucket(null);
			}
			alert("Bucket deleted!");
		} catch (error: any) {
			alert("Failed to delete bucket: " + error.response?.data);
		}
	};

	const deleteObject = async (objectName: string) => {
		if (!selectedBucket || !confirm(`Delete "${objectName}"?`)) return;
		try {
			await axios.delete(
				`${API_URL}/buckets/${selectedBucket}/objects/${objectName}`,
			);
			fetchObjects(selectedBucket);
			alert("Object deleted!");
		} catch (error: any) {
			alert("Failed to delete object: " + error.response?.data);
		}
	};

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	return (
		<div className="max-w-7xl mx-auto p-6">
			<h2 className="text-3xl font-bold text-gray-800 mb-6">
				🗄️ MinIO Bucket Manager
			</h2>

			<div className="grid md:grid-cols-2 gap-6">
				{/* Buckets Panel */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-4">Buckets</h3>

					{/* Create Bucket */}
					<div className="flex gap-2 mb-4">
						<input
							type="text"
							placeholder="New bucket name"
							value={newBucketName}
							onChange={(e) => setNewBucketName(e.target.value)}
							className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
						<button
							onClick={createBucket}
							className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
						>
							Create
						</button>
					</div>

					{/* Bucket List */}
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{buckets.map((bucket) => (
							<div
								key={bucket.name}
								className={`p-3 border rounded-lg cursor-pointer transition-colors ${
									selectedBucket === bucket.name
										? "bg-blue-50 border-blue-500"
										: "bg-gray-50 border-gray-200 hover:bg-gray-100"
								}`}
								onClick={() => setSelectedBucket(bucket.name)}
							>
								<div className="flex justify-between items-center">
									<div>
										<div className="font-semibold text-gray-800">
											📦 {bucket.name}
										</div>
										<div className="text-xs text-gray-500">
											{new Date(bucket.creationDate).toLocaleString()}
										</div>
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											deleteBucket(bucket.name);
										}}
										className="text-red-500 hover:text-red-700 font-bold"
									>
										✕
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Objects Panel */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-4">
						Objects
						{selectedBucket && (
							<span className="text-sm text-gray-500 ml-2">
								in {selectedBucket}
							</span>
						)}
					</h3>

					{!selectedBucket ? (
						<div className="text-center text-gray-500 py-12">
							Select a bucket to view objects
						</div>
					) : (
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{objects.map((obj) => (
								<div
									key={obj.name}
									className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="font-medium text-gray-800 break-all">
												📄 {obj.name}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												{formatBytes(obj.size)} •{" "}
												{new Date(obj.lastModified).toLocaleString()}
											</div>
										</div>
										<button
											onClick={() => deleteObject(obj.name)}
											className="text-red-500 hover:text-red-700 font-bold ml-2"
										>
											✕
										</button>
									</div>
								</div>
							))}

							{objects.length === 0 && (
								<div className="text-center text-gray-500 py-12">
									No objects in this bucket
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
