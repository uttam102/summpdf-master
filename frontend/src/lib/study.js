// Study API Client - Frontend library for study features

const API_BASE = "http://localhost:8081/api";

// Q&A Generation
export async function generateQAPairs(summaryId, count = 5) {
  try {
    const response = await fetch(`${API_BASE}/summaries/${summaryId}/qa/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate Q&A");
    }

    return await response.json();
  } catch (error) {
    console.error("Q&A generation error:", error);
    throw error;
  }
}

// Folder Management
export async function getFolders(userId) {
  try {
    const response = await fetch(`${API_BASE}/folders?user_id=${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch folders");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch folders error:", error);
    throw error;
  }
}

export async function createFolder(folderData) {
  try {
    const response = await fetch(`${API_BASE}/folders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(folderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create folder");
    }

    return await response.json();
  } catch (error) {
    console.error("Create folder error:", error);
    throw error;
  }
}

export async function updateFolder(folderId, updates) {
  try {
    const response = await fetch(`${API_BASE}/folders/${folderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update folder");
    }

    return await response.json();
  } catch (error) {
    console.error("Update folder error:", error);
    throw error;
  }
}

export async function deleteFolder(folderId) {
  try {
    const response = await fetch(`${API_BASE}/folders/${folderId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete folder");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete folder error:", error);
    throw error;
  }
}

export async function moveToFolder(summaryId, folderId) {
  try {
    const response = await fetch(`${API_BASE}/summaries/${summaryId}/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folder_id: folderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to move summary");
    }

    return await response.json();
  } catch (error) {
    console.error("Move to folder error:", error);
    throw error;
  }
}

// Study Schedule
export async function updateStudySchedule(summaryId, schedule) {
  try {
    const response = await fetch(`${API_BASE}/summaries/${summaryId}/study-schedule`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update schedule");
    }

    return await response.json();
  } catch (error) {
    console.error("Update schedule error:", error);
    throw error;
  }
}

// Mark as Reviewed (Spaced Repetition)
export async function markAsReviewed(summaryId, understanding = 3, nextReview = null) {
  try {
    const response = await fetch(`${API_BASE}/summaries/${summaryId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        understanding,
        next_review: nextReview,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to mark as reviewed");
    }

    return await response.json();
  } catch (error) {
    console.error("Mark as reviewed error:", error);
    throw error;
  }
}

// Get Review Queue
export async function getReviewQueue(userId, limit = 10) {
  try {
    const response = await fetch(`${API_BASE}/study/revise?user_id=${userId}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch review queue");
    }

    return await response.json();
  } catch (error) {
    console.error("Get review queue error:", error);
    throw error;
  }
}

// Get Study Stats
export async function getStudyStats(userId) {
  try {
    const response = await fetch(`${API_BASE}/study/stats?user_id=${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch study stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Get study stats error:", error);
    throw error;
  }
}

// Syllabus Extraction
export async function extractSyllabusTopics(fileUrl) {
  try {
    const response = await fetch(`${API_BASE}/syllabus/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_url: fileUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to extract syllabus topics");
    }

    return await response.json();
  } catch (error) {
    console.error("Extract syllabus error:", error);
    throw error;
  }
}
